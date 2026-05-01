/**
 * Mock Payment Gateway — CyberService ESM
 * Simulates real payment clearing system with all UC037 flows:
 * - Normal: success with transaction ID
 * - Alternative 1: validation error
 * - Alternative 2: user cancellation (handled at UI layer)
 * - Exception 1: gateway decline
 * - Exception 2: communication timeout
 *
 * Set PAYMENT_SCENARIO env var to control simulation:
 * "success" | "decline" | "timeout" | "random"
 */

import type {
  IPaymentGateway,
  PaymentGatewayRequest,
  PaymentGatewayResponse,
} from "@/core/usecases/process-payment.uc037";
import { randomUUID } from "crypto";

const GATEWAY_TIMEOUT_MS = 5000; // SLA: 5 seconds max

export class MockPaymentGateway implements IPaymentGateway {
  constructor(private scenario: "success" | "decline" | "timeout" | "random" = "random") {}

  async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    const scenario = this.scenario === "random"
      ? this.randomScenario()
      : this.scenario;

    // Simulate network latency
    const latency = scenario === "timeout" ? 6000 : Math.random() * 800 + 200;

    await this.sleep(Math.min(latency, GATEWAY_TIMEOUT_MS));

    if (scenario === "timeout") {
      throw new Error("Gateway timeout: no response within SLA window");
    }

    if (scenario === "decline") {
      return {
        success: false,
        declineReason: this.randomDeclineReason(),
        errorCode: "CARD_DECLINED",
      };
    }

    // Success
    return {
      success: true,
      transactionId: `GW-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
    };
  }

  private randomScenario(): "success" | "decline" | "timeout" {
    const r = Math.random();
    if (r < 0.70) return "success";
    if (r < 0.90) return "decline";
    return "timeout";
  }

  private randomDeclineReason(): string {
    const reasons = [
      "אשראי לא מספיק",
      "כרטיס אשראי אינו בתוקף",
      "עסקה חסומה על ידי הבנק",
      "חרגת מהמסגרת החודשית",
      "קוד CVV שגוי",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

// Singleton for use in tRPC context
export const mockPaymentGateway = new MockPaymentGateway(
  (process.env.PAYMENT_SCENARIO as "success" | "decline" | "timeout" | "random") ?? "random"
);
