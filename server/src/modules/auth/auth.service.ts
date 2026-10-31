import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { hash, verify } from 'argon2';
import { Model, Types } from 'mongoose';
import { Admin } from './admin.schema.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './jwt-payload.js';

@Injectable()
export class AuthService {
  // Verified against when the email is unknown, so response time doesn't reveal it.
  private readonly dummyHash = hash('dummy-password-for-timing');

  constructor(
    @InjectModel(Admin.name) private readonly admins: Model<Admin>,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const admin = await this.admins.findOne({ email: email.toLowerCase() });
    const valid = admin
      ? await verify(admin.passwordHash, password)
      : await verify(await this.dummyHash, password).then(() => false);
    if (!admin || !valid)
      throw new UnauthorizedException('Invalid credentials');

    admin.lastLoginAt = new Date();
    await admin.save();
    return { accessToken: await this.sign(admin._id, admin.email) };
  }

  async me(id: string) {
    const admin = await this.admins
      .findById(id)
      .select('email lastLoginAt')
      .lean();
    if (!admin) throw new UnauthorizedException();
    return { id, email: admin.email, lastLoginAt: admin.lastLoginAt };
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const admin = await this.admins.findById(id);
    if (!admin) throw new UnauthorizedException();
    if (!(await verify(admin.passwordHash, dto.currentPassword))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    admin.passwordHash = await hash(dto.newPassword);
    admin.passwordChangedAt = new Date();
    await admin.save();
    // Older tokens are now invalid; hand back a fresh one.
    return { accessToken: await this.sign(admin._id, admin.email) };
  }

  /** Used by JwtStrategy: the admin must exist and the token must postdate the last password change. */
  async validateToken(payload: JwtPayload) {
    const admin = await this.admins
      .findById(payload.sub)
      .select('email passwordChangedAt')
      .lean();
    if (!admin) return null;
    const changedAt = admin.passwordChangedAt?.getTime();
    if (changedAt && (payload.iat ?? 0) < Math.floor(changedAt / 1000)) {
      return null;
    }
    return { id: payload.sub, email: admin.email };
  }

  /** Seed helper: creates the single admin if none exists. Returns true if created. */
  async ensureAdmin(email: string, password: string) {
    if (await this.admins.exists({})) return false;
    await this.admins.create({ email, passwordHash: await hash(password) });
    return true;
  }

  private sign(id: Types.ObjectId, email: string) {
    const payload: JwtPayload = { sub: id.toString(), email };
    return this.jwt.signAsync(payload);
  }
}
