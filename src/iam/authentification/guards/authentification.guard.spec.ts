import { AuthentificationGuard } from './authentification.guard';

describe('AuthentificationGuard', () => {
  it('should be defined', () => {
    expect(new AuthentificationGuard()).toBeDefined();
  });
});
