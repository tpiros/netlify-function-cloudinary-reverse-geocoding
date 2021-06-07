require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fetch = require('node-fetch');
const convert = require('./convert');

const config = {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
};

const googleMapKey = process.env.MAPS;

cloudinary.config(config);

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      body: 'METHOD NOT ALLOWED',
      headers: {
        Allow: 'POST',
      },
    };
  } else {
    const body = event.body;
    try {
      const upload = await cloudinary.uploader.upload(body, {
        public_id: 'netlify-uploaded-image',
        image_metadata: true,
      });
      if (upload) {
        const lat = upload.image_metadata.GPSLatitude;
        const lng = upload.image_metadata.GPSLongitude;
        if (!lat || !lng) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message:
                'Image does not contain GPS EXIF metadata. Please use an image with appropriate metadata',
              error: true,
            }),
          };
        }
        const colours = await cloudinary.api.resource(upload.public_id, {
          colors: true,
        });
        const predominantColours = colours.predominant.google;
        // console.log(predominantColours);
        const prominentColours = predominantColours
          .filter((colour) => colour[1] > 35)
          .map((colour) => colour[0]);
        const darkColours = ['black', 'brown', 'blue', 'red', 'orange'];
        // console.log('prominentColours', prominentColours);
        const foundDarkColours = prominentColours.some((colours) =>
          darkColours.includes(colours)
        );
        let colour = 'black';
        if (foundDarkColours) {
          colour = 'white';
        }

        const latlng = convert(lat, lng);
        const response = await (
          await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${googleMapKey}`
          )
        ).json();
        let location = response.plus_code.compound_code;
        location = location.split(' ');
        location.shift();
        location = location.join(' ');
        const finalImage = cloudinary.url(upload.public_id, {
          fetch_format: 'auto',
          quality: 'auto',
          overlay: {
            font_family: 'Roboto',
            font_size: 24,
            font_weight: 'bold',
            text: `Location: ${location}`,
          },
          gravity: 'north',
          y: 40,
          color: colour,
          transformation: [
            {
              radius: 25,
              width: 800,
              crop: 'fit',
            },
          ],
        });
        return {
          statusCode: 200,
          body: JSON.stringify({ url: finalImage }),
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: error, error: true }),
      };
    }
  }
};
