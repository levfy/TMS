import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { CompanyEntity } from '../companies/entities/company.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, companyName, bin } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const existingCompany = await this.companyRepository.findOne({
      where: { bin },
    });

    if (existingCompany) {
      throw new ConflictException('Company already registered');
    }

    const company = this.companyRepository.create({
      name: companyName,
      bin,
      address: registerDto.address || '',
      phone,
      email,
    });
    await this.companyRepository.save(company);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      phone,
      passwordHash: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: 'COMPANY_ADMIN' as any,
      company,
      status: 'ACTIVE' as any,
    });
    await this.userRepository.save(user);

    this.logger.log(`Registered: ${email}`, 'AuthService');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...(await this.generateTokens(user)),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: email ? [{ email }] : [{ phone }],
      relations: ['company'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if ((user.status as any) !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive');
    }

    this.logger.log(`Login: ${user.email}`, 'AuthService');

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
      },
      ...(await this.generateTokens(user)),
    };
  }

  private async generateTokens(user: UserEntity) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: (user.company as any)?.id,
    };

    // Use number for expiresIn (seconds) to satisfy @nestjs/jwt type constraints
    const accessToken = this.jwtService.sign(payload, { expiresIn: 900 });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: 2592000 });

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserById(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });
  }
}
