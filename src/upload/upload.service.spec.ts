import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    it('should return success message and filename when file is uploaded', () => {
      const mockFile = {
        filename: 'my-avatar-123.png',
      } as Express.Multer.File;

      const result = service.handleFileUpload(mockFile);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filename: 'my-avatar-123.png',
      });
    });

    it('should throw BadRequestException when no file is provided', () => {
      const executeFunction = () => {
        service.handleFileUpload(undefined as any);
      };

      expect(executeFunction).toThrow(BadRequestException);
      expect(executeFunction).toThrow('No file uploaded');
    });
  });
});
