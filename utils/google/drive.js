import axios from 'axios';
import { Readable } from "stream";
import { gauth } from './gauth.js';
import logger from '../../logs/logger.js';
import { constants } from '../../constants.js';

const { drive } = gauth();
const { FOLDER_ID } = constants;
const module = import.meta.filename;

const upload_file_to_drive = async (image, name, mimeType) => {
    const response = await axios.get(image, { responseType: 'arraybuffer' });
    const buffer = await response.data;

    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    const fileMetadata = { name, parents: [FOLDER_ID] };
    const media = { mimeType, body: fileStream };

    try {
        const { data: { id } } = await drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id',
        });
        if (id) {
            logger.success(`File uploaded successfully! File ID: ${id}`);
            return id;
        }
    } catch (error) {
        logger.error(`Error uploading file to Google Drive: ${error}`);
    }
}

export { upload_file_to_drive };