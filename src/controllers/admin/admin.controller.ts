import { generateToken, hashPassword, verifyHash } from "@/core";
import { adminService } from "@/services/admin.service";
import { prismaService } from "@/services/prisma.service";
import { AdminRole } from "@prisma/client";
import { type NextFunction, type Request, type Response } from "express";
import createHttpError from "http-errors";
import { log } from "node:console";

class AdminController {

  public getAllAdmin = async(
    req:Request, res:Response, next:NextFunction
  )=>{
    // log("getAllAdmin")
    try {
      log("hey")
      // const role = req.admin.role 
    // log(role)
      const fetchAllAdmin = await prismaService.admin.findMany({
        where:{role:AdminRole.supportAdmin}
      })
// log("all admin:",fetchAllAdmin)
      res.json({ message: "Admin created successfully", data: fetchAllAdmin });
      
    } catch (error) {
      log("error")
      // next(error)
    }
  }
}
export const adminController = new AdminController();
export type { AdminController };
