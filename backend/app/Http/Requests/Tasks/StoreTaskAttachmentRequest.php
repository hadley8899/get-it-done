<?php

namespace App\Http\Requests\Tasks;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Validator;

class StoreTaskAttachmentRequest extends FormRequest
{
    private const int MAX_FILE_SIZE_KB = 51200; // 50MB

    private const array IMAGE_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
    ];

    private const array ALLOWED_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
        'pdf', 'csv', 'txt', 'md', 'log', 'json', 'xml', 'yml', 'yaml', 'sql',
        'php', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf',
        'zip', '7z', 'rar', 'tar', 'gz', 'tgz', 'mp3',
    ];

    private const array BLOCKED_EXTENSIONS = [
        'exe', 'msi', 'bin', 'dll', 'com', 'scr', 'bat', 'cmd', 'pif',
        'ps1', 'sh', 'dmg', 'pkg', 'apk', 'jar',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'No file was provided.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $rawUpload = $_FILES['file'] ?? null;
            $uploadError = (int) ($rawUpload['error'] ?? UPLOAD_ERR_OK);

            if ($uploadError !== UPLOAD_ERR_OK) {
                $validator->errors()->add('file', $this->messageForUploadError($uploadError));
                return;
            }

            /** @var UploadedFile|null $file */
            $file = $this->file('file');
            if (!$file) {
                $validator->errors()->add('file', 'Upload failed before validation. File payload was not received.');
                return;
            }

            if (!$file->isValid()) {
                $validator->errors()->add('file', $this->messageForUploadError($file->getError()));
                return;
            }

            if (($file->getSize() ?? 0) > self::MAX_FILE_SIZE_KB * 1024) {
                $validator->errors()->add('file', 'File is too large. Maximum size is 50MB per file.');
                return;
            }

            $extension = strtolower((string) $file->getClientOriginalExtension());
            if ($extension === '') {
                $validator->errors()->add('file', 'File extension is required.');
                return;
            }

            if (in_array($extension, self::BLOCKED_EXTENSIONS, true)) {
                $validator->errors()->add('file', 'This file type is not allowed.');
                return;
            }

            if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
                $validator->errors()->add('file', 'Unsupported file type.');
            }
        });
    }

    public static function isImageExtension(string $extension): bool
    {
        return in_array(strtolower($extension), self::IMAGE_EXTENSIONS, true);
    }

    private function messageForUploadError(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Uploaded file is larger than the server allows.',
            UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server upload temp directory is missing.',
            UPLOAD_ERR_CANT_WRITE => 'Server failed to write uploaded file to disk.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.',
            default => "Upload failed with server error code {$errorCode}.",
        };
    }
}
