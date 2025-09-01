import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Add this import
import { GuestCarritoService } from './guest-carrito';

describe('GuestCarritoService', () => {
  let service: GuestCarritoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Add this line
      providers: [GuestCarritoService]    // Explicitly provide your service
    });
    
    service = TestBed.inject(GuestCarritoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});