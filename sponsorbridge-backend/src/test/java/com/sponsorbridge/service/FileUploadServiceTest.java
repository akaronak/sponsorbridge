package com.sponsorbridge.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@DisplayName("FileUploadService Tests")
class FileUploadServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private MultipartFile mockFile;

    private FileUploadService fileUploadService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(cloudinary.uploader()).thenReturn(uploader);
        fileUploadService = new FileUploadService(cloudinary);
    }

    @Test
    @DisplayName("Should successfully upload a valid PDF file")
    void testUploadValidPdfFile() throws IOException {
        // Arrange
        byte[] fileContent = "PDF content".getBytes();
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(1024L);
        when(mockFile.getBytes()).thenReturn(fileContent);

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/file.pdf");
        when(uploader.upload(eq(fileContent), any(Map.class))).thenReturn(uploadResult);

        // Act
        String result = fileUploadService.uploadProposal(mockFile);

        // Assert
        assertNotNull(result);
        assertEquals("https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/file.pdf", result);
        verify(uploader, times(1)).upload(eq(fileContent), any(Map.class));
    }

    @Test
    @DisplayName("Should reject null file")
    void testUploadNullFile() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(null)
        );
        assertEquals("File is required", exception.getMessage());
    }

    @Test
    @DisplayName("Should reject empty file")
    void testUploadEmptyFile() {
        // Arrange
        when(mockFile.isEmpty()).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertEquals("File is required", exception.getMessage());
    }

    @Test
    @DisplayName("Should reject non-PDF file")
    void testUploadNonPdfFile() {
        // Arrange
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/msword");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertEquals("File type must be PDF (application/pdf)", exception.getMessage());
    }

    @Test
    @DisplayName("Should reject file exceeding 10MB size limit")
    void testUploadFileTooLarge() {
        // Arrange
        long fileSize = 10485761L; // 10MB + 1 byte
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(fileSize);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertEquals("File size must not exceed 10MB", exception.getMessage());
    }

    @Test
    @DisplayName("Should accept file exactly at 10MB limit")
    void testUploadFileAtMaxSize() throws IOException {
        // Arrange
        byte[] fileContent = new byte[(int) 10485760];
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(10485760L);
        when(mockFile.getBytes()).thenReturn(fileContent);

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/file.pdf");
        when(uploader.upload(eq(fileContent), any(Map.class))).thenReturn(uploadResult);

        // Act
        String result = fileUploadService.uploadProposal(mockFile);

        // Assert
        assertNotNull(result);
        assertEquals("https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/file.pdf", result);
    }

    @Test
    @DisplayName("Should handle Cloudinary upload failure")
    void testUploadCloudinaryFailure() throws IOException {
        // Arrange
        byte[] fileContent = "PDF content".getBytes();
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(1024L);
        when(mockFile.getBytes()).thenReturn(fileContent);

        when(uploader.upload(eq(fileContent), any(Map.class)))
            .thenThrow(new IOException("Network error"));

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertTrue(exception.getMessage().contains("Failed to upload file to Cloudinary"));
        assertTrue(exception.getMessage().contains("Network error"));
    }

    @Test
    @DisplayName("Should reject file with null content type")
    void testUploadFileWithNullContentType() {
        // Arrange
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn(null);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertEquals("File type must be PDF (application/pdf)", exception.getMessage());
    }

    @Test
    @DisplayName("Should reject file with incorrect MIME type")
    void testUploadFileWithIncorrectMimeType() {
        // Arrange
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("text/plain");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> fileUploadService.uploadProposal(mockFile)
        );
        assertEquals("File type must be PDF (application/pdf)", exception.getMessage());
    }

    @Test
    @DisplayName("Should upload file with small size")
    void testUploadSmallFile() throws IOException {
        // Arrange
        byte[] fileContent = "small".getBytes();
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(5L);
        when(mockFile.getBytes()).thenReturn(fileContent);

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/small.pdf");
        when(uploader.upload(eq(fileContent), any(Map.class))).thenReturn(uploadResult);

        // Act
        String result = fileUploadService.uploadProposal(mockFile);

        // Assert
        assertNotNull(result);
        assertEquals("https://res.cloudinary.com/demo/image/upload/v1234567890/sponsorbridge/proposals/small.pdf", result);
    }
}
