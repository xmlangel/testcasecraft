"""MinIO storage service for document management"""
import io
import logging
from typing import Optional, BinaryIO
from datetime import timedelta
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile, HTTPException

from ..core.config import settings

logger = logging.getLogger(__name__)


class MinIOService:
    """Service for interacting with MinIO object storage"""

    def __init__(self):
        """Initialize MinIO client"""
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created MinIO bucket: {self.bucket_name}")
            else:
                logger.info(f"MinIO bucket already exists: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise HTTPException(status_code=500, detail=f"MinIO bucket error: {str(e)}")

    async def upload_file(
        self,
        file: UploadFile,
        object_key: str,
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload a file to MinIO

        Args:
            file: FastAPI UploadFile object
            object_key: Unique key for the object in MinIO
            content_type: MIME type of the file

        Returns:
            dict: Upload metadata including bucket, key, and size
        """
        try:
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)

            # Reset file pointer for potential re-use
            await file.seek(0)

            # Determine content type
            if content_type is None:
                content_type = file.content_type or "application/octet-stream"

            # Upload to MinIO
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_key,
                data=io.BytesIO(file_content),
                length=file_size,
                content_type=content_type
            )

            logger.info(f"Uploaded file to MinIO: {object_key} ({file_size} bytes)")

            return {
                "bucket": self.bucket_name,
                "object_key": object_key,
                "file_size": file_size,
                "content_type": content_type
            }

        except S3Error as e:
            logger.error(f"MinIO upload error: {e}")
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during upload: {e}")
            raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

    def download_file(self, object_key: str) -> BinaryIO:
        """
        Download a file from MinIO

        Args:
            object_key: Key of the object in MinIO

        Returns:
            BinaryIO: File stream
        """
        try:
            response = self.client.get_object(
                bucket_name=self.bucket_name,
                object_name=object_key
            )
            logger.info(f"Downloaded file from MinIO: {object_key}")
            return response

        except S3Error as e:
            logger.error(f"MinIO download error for {object_key}: {e}")
            if e.code == "NoSuchKey":
                raise HTTPException(status_code=404, detail="File not found in storage")
            raise HTTPException(status_code=500, detail=f"File download failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during download: {e}")
            raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")

    def delete_file(self, object_key: str) -> bool:
        """
        Delete a file from MinIO

        Args:
            object_key: Key of the object in MinIO

        Returns:
            bool: True if deletion was successful
        """
        try:
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=object_key
            )
            logger.info(f"Deleted file from MinIO: {object_key}")
            return True

        except S3Error as e:
            logger.error(f"MinIO delete error for {object_key}: {e}")
            # Don't raise exception if file doesn't exist
            if e.code == "NoSuchKey":
                logger.warning(f"File not found in MinIO, skipping deletion: {object_key}")
                return True
            raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during deletion: {e}")
            raise HTTPException(status_code=500, detail=f"Deletion error: {str(e)}")

    def get_file_metadata(self, object_key: str) -> dict:
        """
        Get metadata for a file in MinIO

        Args:
            object_key: Key of the object in MinIO

        Returns:
            dict: File metadata including size, content_type, etc.
        """
        try:
            stat = self.client.stat_object(
                bucket_name=self.bucket_name,
                object_name=object_key
            )

            return {
                "bucket": self.bucket_name,
                "object_key": object_key,
                "size": stat.size,
                "content_type": stat.content_type,
                "etag": stat.etag,
                "last_modified": stat.last_modified
            }

        except S3Error as e:
            logger.error(f"MinIO stat error for {object_key}: {e}")
            if e.code == "NoSuchKey":
                raise HTTPException(status_code=404, detail="File not found in storage")
            raise HTTPException(status_code=500, detail=f"Failed to get file metadata: {str(e)}")

    def generate_presigned_url(self, object_key: str, expires: timedelta = timedelta(hours=1)) -> str:
        """
        Generate a presigned URL for temporary file access

        Args:
            object_key: Key of the object in MinIO
            expires: URL expiration time (default: 1 hour)

        Returns:
            str: Presigned URL
        """
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_key,
                expires=expires
            )
            logger.info(f"Generated presigned URL for: {object_key}")
            return url

        except S3Error as e:
            logger.error(f"MinIO presigned URL error for {object_key}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")


# Global MinIO service instance
_minio_service: Optional[MinIOService] = None


def get_minio_service() -> MinIOService:
    """Dependency injection for MinIO service"""
    global _minio_service
    if _minio_service is None:
        _minio_service = MinIOService()
    return _minio_service
