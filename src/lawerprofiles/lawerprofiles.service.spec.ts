import { Test, TestingModule } from '@nestjs/testing';
import { LawerprofilesService } from './lawerprofiles.service';

describe('LawerprofilesService', () => {
  let service: LawerprofilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LawerprofilesService],
    }).compile();

    service = module.get<LawerprofilesService>(LawerprofilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
