package process

import (
	"testing"

	"wha-console/config"
)

func TestCalculateLimits(t *testing.T) {
	cfg := &config.Config{
		RAMPerProcessMB: 150,
		MaxRAMPercent:   80.0,
		MaxProcesses:    0,
	}

	limits := CalculateLimits(cfg, 0, 0)
	if limits.TotalRAMMB == 0 {
		t.Errorf("expected TotalRAMMB to be > 0")
	}
	if limits.RAMPerProcessMB != 150 {
		t.Errorf("expected RAMPerProcessMB to be 150, got %d", limits.RAMPerProcessMB)
	}
	if limits.MaxAllowedProcesses < 1 {
		t.Errorf("expected MaxAllowedProcesses >= 1, got %d", limits.MaxAllowedProcesses)
	}

	// Test when running count exceeds max allowed processes
	limitsLimitReached := CalculateLimits(cfg, limits.MaxAllowedProcesses+1, 0)
	if !limitsLimitReached.LimitReached {
		t.Errorf("expected LimitReached to be true when running processes exceed max allowed")
	}
	if limitsLimitReached.Message != ServerLimitReachedMessage {
		t.Errorf("expected error message %q, got %q", ServerLimitReachedMessage, limitsLimitReached.Message)
	}
}
