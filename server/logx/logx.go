// logx/logx.go (or anywhere)
package logx

import (
	"strings"
)

func MaskToken(s string) string {
	if s == "" { return "" }
	if len(s) <= 12 { return "***" }
	return s[:6] + "..." + s[len(s)-6:]
}

func IsWSUpgrade(h string) bool {
	return strings.EqualFold(h, "websocket")
}
