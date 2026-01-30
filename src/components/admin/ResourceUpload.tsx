"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthProvider";
import { uploadFile } from "@/lib/firebase/storage";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Upload, X, FileText, CheckCircle } from "lucide-react";

export default function ResourceUpload() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title with filename if empty
            if (!title) {
                const name = e.target.files[0].name.split(".")[0];
                setTitle(name);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user) return;

        // Check Plan Limits (Simple Client-Side Check)
        // In production, this should be done via Cloud Functions or Security Rules
        const MAX_SIZE_MB = 100; // Example limit
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`File too large. Plan limit is ${MAX_SIZE_MB}MB.`);
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            // 1. Upload File to Storage
            // Path: organizations/{orgId}/resources/{filename}-{timestamp}
            const timestamp = Date.now();
            const path = `organizations/${user.organizationId}/resources/${timestamp}-${file.name}`;

            const downloadURL = await uploadFile(file, path, (p) => setProgress(p));

            // 2. Create Resource Document in Firestore
            await addDoc(collection(db, "resources"), {
                organizationId: user.organizationId,
                title,
                description,
                type: getFileType(file.type),
                fileUrl: downloadURL,
                storagePath: path,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                downloadAllowed: true, // Default
                visibility: "public",
                createdBy: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                metadata: {
                    views: 0,
                    downloads: 0
                },
                tags: [] // TODO: Add tags support
            });

            setSuccess(true);
            // Reset form
            setFile(null);
            setTitle("");
            setDescription("");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const getFileType = (mime: string) => {
        if (mime.startsWith("image/")) return "image";
        if (mime.startsWith("video/")) return "video";
        if (mime === "application/pdf") return "pdf";
        return "doc"; // Fallback
    };

    return (
        <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Resource</h2>

            {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-green-600">
                    <CheckCircle className="h-12 w-12 mb-2" />
                    <p className="font-medium">Resource uploaded successfully!</p>
                    <Button variant="ghost" className="mt-4" onClick={() => setSuccess(false)}>Upload Another</Button>
                </div>
            ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                            {file ? (
                                <>
                                    <FileText className="h-10 w-10 text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={(e) => {
                                        e.preventDefault();
                                        setFile(null);
                                    }}>
                                        Change File
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <span className="text-sm font-medium text-gray-900">Click to upload or drag and drop</span>
                                    <span className="text-xs text-gray-500">PDF, PPT, DOC, Images, Video</span>
                                </>
                            )}
                        </label>
                    </div>

                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Resource Title"
                        required
                    />

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this resource..."
                        />
                    </div>

                    {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <Button type="submit" disabled={uploading || !file} className="w-full" isLoading={uploading}>
                        {uploading ? `Uploading ${Math.round(progress)}%` : "Upload Resource"}
                    </Button>
                </form>
            )}
        </Card>
    );
}
