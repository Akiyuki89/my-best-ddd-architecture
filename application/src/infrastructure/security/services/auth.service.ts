import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { IJwtPayload } from '@shared/interfaces/jwt-payload.interface';
import { ErrorHandlingUtil } from '@shared/utils/error.util';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');
    this.jwtExpiration = this.configService.get<string>('JWT_EXPIRATION') || '1h';
    this.refreshTokenExpiration = this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') || '7d';
  }

  generateToken(userId: string, role: string): { accessToken: string; refreshToken: string } {
    const payload: IJwtPayload = { userId, role };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiration });
    const refreshToken = jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTokenExpiration });

    return { accessToken, refreshToken };
  }

  validateToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as IJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ErrorHandlingUtil.handleTokenExpiredError();
      } else if (error instanceof jwt.JsonWebTokenError) {
        ErrorHandlingUtil.handleInvalidTokenError();
      } else {
        throw new UnauthorizedException('Could not validate token');
      }
    }
  }

  refreshAccessToken(refreshToken: string): { accessToken: string } {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as IJwtPayload;

      const newAccessToken = jwt.sign({ userId: payload.userId, role: payload.role }, this.jwtSecret, {
        expiresIn: this.jwtExpiration,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        ErrorHandlingUtil.handleRefreshTokenExpiredError();
      } else {
        ErrorHandlingUtil.handleInvalidTokenError();
      }
    }
  }

  getTokenExpiration(token: string): number {
    const decoded = jwt.decode(token) as { exp: number };

    if (!decoded || !decoded.exp) {
      ErrorHandlingUtil.handleMalformedTokenError();
    }

    return decoded.exp - Math.floor(Date.now() / 1000);
  }
}
