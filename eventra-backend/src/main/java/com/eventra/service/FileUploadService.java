package com.eventra.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileUploadService {

    private static final String ALLOWED_MIME_TYPE = "application/pdf";
    private static final long MAX_FILE_SIZE = 10485760; // 10MB in bytes
    private static final String UPLOAD_FOLDER = "eventra/proposals";

    private final Cloudinary cloudinary;

    public FileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadProposal(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        if (!ALLOWED_MIME_TYPE.equals(file.getContentType())) {
            throw new IllegalArgumentException("File type must be PDF (application/pdf)");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 10MB");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", UPLOAD_FOLDER,
                    "resource_type", "auto"
                )
            );

            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }
}
