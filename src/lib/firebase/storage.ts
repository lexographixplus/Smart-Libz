import { storage } from "./config";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    UploadTask
} from "firebase/storage";

export const uploadFile = (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        // Add metadata for better tracking
        const metadata = {
            contentType: file.type,
            customMetadata: {
                originalName: file.name
            }
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

export const deleteFile = async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
};
