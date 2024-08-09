import { TestBed } from '@angular/core/testing';

import { OnlyLoggedOffUsersGuard } from './only-logged-off-users.guard';

describe('OnlyLoggedOffUsersGuard', () => {
  let guard: OnlyLoggedOffUsersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OnlyLoggedOffUsersGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
