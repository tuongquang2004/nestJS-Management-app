import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/guards';

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-12345',
}));

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  const mockUploadService = {
    handleFileUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadAvatar', () => {
    it('should call handleFileUpload from service and return success message', () => {
      const mockFile = {
        originalname: 'avatar.png',
        filename: 'avatar-12345.png',
        mimetype: 'image/png',
        size: 1024,
      } as Express.Multer.File;

      const expectedResult = {
        message: 'File uploaded successfully',
        filename: mockFile.filename,
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadAvatar(mockFile);

      expect(mockUploadService.handleFileUpload).toHaveBeenCalledTimes(1);
      expect(mockUploadService.handleFileUpload).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadPostImage', () => {
    it('should call handleFileUpload from service and return success message', () => {
      const mockFile = {
        originalname: 'post.jpg',
        filename: 'post-98765.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      } as Express.Multer.File;

      const expectedResult = {
        message: 'File uploaded successfully',
        filename: mockFile.filename,
      };

      mockUploadService.handleFileUpload.mockReturnValue(expectedResult);

      const result = controller.uploadPostImage(mockFile);

      expect(mockUploadService.handleFileUpload).toHaveBeenCalledTimes(1);
      expect(mockUploadService.handleFileUpload).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(expectedResult);
    });
  });
});
