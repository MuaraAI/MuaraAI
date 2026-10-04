import { describe, it, expect, vi } from "vitest";
import { submitContactMessage } from "../src/app/actions/contact";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/notify", () => ({
  notifyMaintainers: vi.fn().mockResolvedValue({ resend: true }),
}));

describe("Contact & Inbox Server Actions", () => {
  it("rejects contact submission with invalid email", async () => {
    const res = await submitContactMessage({
      senderName: "PT Maju AI",
      senderEmail: "invalid-email-address",
      subject: "Peluang Kerjasama",
      message: "Halo kami ingin berdiskusi mengenai proyek kolaborasi.",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Alamat email tidak valid.");
  });

  it("rejects contact submission with message too short", async () => {
    const res = await submitContactMessage({
      senderName: "PT Maju AI",
      senderEmail: "partner@perusahaan.com",
      subject: "Peluang",
      message: "Pendek",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Isi pesan minimal 10 karakter.");
  });

  it("accepts valid contact submission and dispatches notifications", async () => {
    const res = await submitContactMessage({
      senderName: "Budi Santoso",
      senderEmail: "budi@techindo.id",
      organization: "PT Tech Indo",
      subject: "Undangan Hackathon & Sponsorship",
      message: "Halo tim Muara AI, kami ingin mengundang komunitas Anda untuk berpartisipasi dalam hackathon.",
    });

    expect(res.success).toBe(true);
  });
});
