import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
    controller = new AppController(service);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });

    it('should call service.getHello()', () => {
      const spy = jest.spyOn(service, 'getHello');
      
      controller.getHello();
      
      expect(spy).toHaveBeenCalled();
    });

    it('should return a string', () => {
      expect(typeof controller.getHello()).toBe('string');
    });

    it('should not return null or undefined', () => {
      expect(controller.getHello()).toBeDefined();
      expect(controller.getHello()).not.toBeNull();
    });
  });
});
