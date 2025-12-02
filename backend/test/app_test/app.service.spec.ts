import { AppService } from './Application/Services/app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });

    it('should return a string', () => {
      expect(typeof service.getHello()).toBe('string');
    });

    it('should not return null or undefined', () => {
      expect(service.getHello()).toBeDefined();
      expect(service.getHello()).not.toBeNull();
    });
  });
});
