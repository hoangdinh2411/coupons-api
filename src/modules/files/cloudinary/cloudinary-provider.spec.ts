import { Provider } from '@nestjs/common';

describe('CloudinaryProvider', () => {
  let provider: Provider;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [CloudinaryProvider]
  //   }).compile();

  //   provider = module.get<Provider>(CloudinaryProvider);
  // });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
