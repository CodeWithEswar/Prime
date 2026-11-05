// @vitest-environment node
import { beforeEach,describe,it,expect,vi } from "vitest";
import { z } from "zod";
vi.mock("server-only",()=>({}));
const auth=vi.hoisted(()=>({getUser:vi.fn(),enabled:true}));
vi.mock("@/lib/supabase/server",()=>({createClient:async()=>({auth:{getUser:auth.getUser}})}));
vi.mock("@/lib/ai/config",()=>({aiEnabled:()=>auth.enabled}));
import { aiSession,readAIInput,aiErrorResponse } from "@/features/ai/server/http";
beforeEach(()=>{auth.enabled=true;auth.getUser.mockResolvedValue({data:{user:{id:"server-owner"}},error:null});});
const request=(origin="http://localhost:3000")=>new Request("http://localhost:3000/api/ai/chat",{method:"POST",headers:{origin,"content-type":"application/json"},body:'{"message":"Explain"}'});
describe("AI HTTP security",()=>{
  it("derives identity from verified authentication",async()=>{expect((await aiSession(request())).userId).toBe("server-owner");});
  it("rejects cross-site and missing-origin mutations",async()=>{await expect(aiSession(request("https://evil.example"))).rejects.toMatchObject({status:403});const noOrigin=request();noOrigin.headers.delete("origin");await expect(aiSession(noOrigin)).rejects.toMatchObject({status:403});});
  it("denies unauthenticated and disabled requests",async()=>{auth.getUser.mockResolvedValue({data:{user:null},error:null});await expect(aiSession(request())).rejects.toMatchObject({status:401});auth.enabled=false;await expect(aiSession(request())).rejects.toMatchObject({code:"DISABLED"});});
  it("bounds actual streamed input bytes",async()=>{const r=new Request("http://localhost/api/ai/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:"x".repeat(33000)})});await expect(readAIInput(r,z.object({text:z.string()}))).rejects.toMatchObject({status:413});});
  it("normalizes invalid JSON and validation errors without raw inputs",async()=>{await expect(readAIInput(request(),z.object({id:z.uuid()}))).rejects.toMatchObject({status:400});const result=aiErrorResponse(new z.ZodError([]));expect(result.status).toBe(400);expect(result.headers.get("cache-control")).toContain("no-store");});
});
