package process

import (
	"math"

	"github.com/shirou/gopsutil/v3/mem"

	"wha-console/config"
)

const ServerLimitReachedMessage = "server limit reached, please we aren't able to provide enough services to run your session, we are working to increase usage limits for everyone"

type SystemLimits struct {
	TotalRAMMB          uint64  `json:"total_ram_mb"`
	AvailableRAMMB      uint64  `json:"available_ram_mb"`
	UsedRAMMB           uint64  `json:"used_ram_mb"`
	UsedRAMPercent      float64 `json:"used_ram_percent"`
	RAMPerProcessMB     uint64  `json:"ram_per_process_mb"`
	MaxRAMPercent       float64 `json:"max_ram_percent"`
	MaxAllowedProcesses int     `json:"max_allowed_processes"`
	RunningProcesses    int     `json:"running_processes"`
	WaitlistCount       int     `json:"waitlist_count"`
	LimitReached        bool    `json:"limit_reached"`
	Message             string  `json:"message,omitempty"`
}

// CalculateLimits detects host memory and computes maximum concurrent whatsrook processes.
func CalculateLimits(cfg *config.Config, runningCount int, waitlistCount int) SystemLimits {
	v, err := mem.VirtualMemory()
	var totalMB, availableMB, usedMB uint64
	var usedPercent float64

	if err == nil && v != nil {
		totalMB = v.Total / (1024 * 1024)
		availableMB = v.Available / (1024 * 1024)
		usedMB = v.Used / (1024 * 1024)
		usedPercent = v.UsedPercent
	} else {
		// Fallback defaults if sys info is unavailable
		totalMB = 2048
		availableMB = 1024
		usedMB = 1024
		usedPercent = 50.0
	}

	ramPerProcess := cfg.RAMPerProcessMB
	if ramPerProcess == 0 {
		ramPerProcess = 150
	}

	maxRAMPercent := cfg.MaxRAMPercent
	if maxRAMPercent <= 0 || maxRAMPercent > 100 {
		maxRAMPercent = 80.0
	}

	usableRAMMB := uint64(float64(totalMB) * (maxRAMPercent / 100.0))
	calculatedMaxProcesses := int(usableRAMMB / ramPerProcess)
	if calculatedMaxProcesses < 1 {
		calculatedMaxProcesses = 1
	}

	if cfg.MaxProcesses > 0 && cfg.MaxProcesses < calculatedMaxProcesses {
		calculatedMaxProcesses = cfg.MaxProcesses
	}

	limitReached := runningCount >= calculatedMaxProcesses || availableMB < ramPerProcess

	limits := SystemLimits{
		TotalRAMMB:          totalMB,
		AvailableRAMMB:      availableMB,
		UsedRAMMB:           usedMB,
		UsedRAMPercent:      math.Round(usedPercent*100) / 100,
		RAMPerProcessMB:     ramPerProcess,
		MaxRAMPercent:       maxRAMPercent,
		MaxAllowedProcesses: calculatedMaxProcesses,
		RunningProcesses:    runningCount,
		WaitlistCount:       waitlistCount,
		LimitReached:        limitReached,
	}

	if limitReached {
		limits.Message = ServerLimitReachedMessage
	}

	return limits
}
