import { Test, TestingModule } from '@nestjs/testing';
import { LawerprofilesController } from './lawerprofiles.controller';
import { LawerprofilesService } from './lawerprofiles.service';

describe('LawerprofilesController', () => {
  let controller: LawerprofilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LawerprofilesController],
      providers: [LawerprofilesService],
    }).compile();

    controller = module.get<LawerprofilesController>(LawerprofilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
