# High Priority: Memory Leaks from setInterval/setTimeout

## 🟠 Severity: HIGH

## Description
Multiple components use `setInterval` and `setTimeout` without proper cleanup in `ngOnDestroy`, causing memory leaks that degrade performance over time.

## Affected Files

### Critical Issue: Infinite Health Check Loop
- **File:** `src/app/admin/components/admin-layout/admin-layout.component.ts:302`
- **Issue:** `setInterval` for health check runs indefinitely without cleanup
- **Code:**
```typescript
setInterval(() => {
  this.checkDatabaseHealth();
}, 30000);
```

### Other Issues
- **File:** `src/app/pages/contact/contact.component.ts:215-224`
  - Multiple `setTimeout` calls without cleanup
  - Nested `setTimeout` at line 221

- **File:** `src/app/admin/components/change-password/change-password.component.ts:280`
  - `setTimeout` without cleanup

## Impact
- ⚠️ Memory leaks in long-running sessions
- ⚠️ Performance degradation over time
- ⚠️ Increased CPU and memory usage
- ⚠️ Application slowdown for users
- ⚠️ Timers continue running even after component is destroyed

## Demonstration of Impact
**Example:** Admin layout component with health check interval:
1. User opens admin panel → interval starts (every 30 seconds)
2. User navigates away → interval STILL runs
3. User opens admin panel again → another interval starts
4. After 10 navigations → 10 intervals running simultaneously
5. Result: Database health check runs every 3 seconds instead of 30!

## Recommended Fix

### Fix 1: Store Timer ID and Clear in ngOnDestroy
**Before:**
```typescript
export class AdminLayoutComponent implements OnInit {
  ngOnInit() {
    setInterval(() => {
      this.checkDatabaseHealth();
    }, 30000);
  }
}
```

**After:**
```typescript
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private healthCheckInterval?: number;

  ngOnInit() {
    this.healthCheckInterval = setInterval(() => {
      this.checkDatabaseHealth();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
```

### Fix 2: Use RxJS interval with takeUntilDestroyed
```typescript
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class AdminLayoutComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(30000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkDatabaseHealth();
    });
  }
}
```

### Fix 3: Store All Timer IDs
```typescript
export class ContactComponent implements OnDestroy {
  private timers: number[] = [];

  onSubmit() {
    const timer1 = setTimeout(() => {
      this.showSuccess = true;
      const timer2 = setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
      this.timers.push(timer2);
    }, 1500);
    this.timers.push(timer1);
  }

  ngOnDestroy() {
    this.timers.forEach(timer => clearTimeout(timer));
  }
}
```

## Testing
To verify the fix works:
```typescript
// Add to component
ngOnDestroy() {
  console.log('Component destroyed, cleaning up timers');
  // cleanup code
}
```

Then navigate away and back multiple times. Console should show cleanup messages.

## Steps to Fix
1. ✅ Identify all `setInterval`/`setTimeout` calls
2. ✅ Store timer IDs in component properties
3. ✅ Implement `ngOnDestroy` with cleanup
4. ✅ Test by navigating away and back
5. ✅ Verify no timers running after component destroy

## Priority
🟠 **HIGH** - Causes performance degradation in production
