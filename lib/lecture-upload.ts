import { clientFetch } from "@/lib/client-api";
import type { Lecture, PresignedLectureUpload } from "@/lib/types";

const PDF_CONTENT_TYPE = "application/pdf";

function putFile(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", PDF_CONTENT_TYPE);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () =>
      reject(new Error("Network error while uploading the file."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(file);
  });
}

export async function uploadLecture({
  subjectId,
  file,
  title,
  onProgress,
}: {
  subjectId: string;
  file: File;
  title: string;
  onProgress?: (percent: number) => void;
}): Promise<Lecture> {
  const presign = await clientFetch<PresignedLectureUpload>("/lectures/presign", {
    method: "POST",
    body: JSON.stringify({
      subjectId,
      fileName: file.name,
      contentType: PDF_CONTENT_TYPE,
      size: file.size,
    }),
  });

  await putFile(presign.uploadUrl, file, onProgress);

  return clientFetch<Lecture>("/lectures", {
    method: "POST",
    body: JSON.stringify({
      subjectId,
      title,
      fileName: file.name,
      objectKey: presign.objectKey,
      size: file.size,
      contentType: PDF_CONTENT_TYPE,
    }),
  });
}