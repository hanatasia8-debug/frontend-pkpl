import { describe, it, expect } from "vitest";
import { KKN_MEMBERS, KKN_INFO } from "@/shared/data/kkn-team.data";

describe("KKN Memorial Feature", () => {
  it("should have exactly 29 verified members", () => {
    expect(KKN_MEMBERS).toHaveLength(29);
  });

  it("should enforce strict privacy with NO phone number or NIM in any member", () => {
    KKN_MEMBERS.forEach((member) => {
      expect(member).not.toHaveProperty("phone");
      expect(member).not.toHaveProperty("phoneNumber");
      expect(member).not.toHaveProperty("nim");
      expect(member).not.toHaveProperty("whatsapp");
      expect(member.name).toBeDefined();
      expect(member.role).toBeDefined();
      expect(member.major).toBeDefined();
      expect(member.faculty).toBeDefined();
    });
  });

  it("should have valid KKN information", () => {
    expect(KKN_INFO.title).toBe("KKN DESA PRINGGODANI");
    expect(KKN_INFO.year).toBe("2026");
    expect(KKN_INFO.appreciationQuote).toContain("Desa Pringgodani");
  });
});
