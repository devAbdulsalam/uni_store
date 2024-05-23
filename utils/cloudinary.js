import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

const uploader = (file, folder) => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file,
			{
				resource_type: 'auto',
				folder: `${process.env.PROJECT_NAME}/${folder}`,
			},
			(error, result) => {
				if (error) {
					reject(error);
				} else {
					resolve({
						public_id: result.public_id,
						url: result.url,
					});
				}
			}
		);
	});
};

export { uploader, cloudinary };
