import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private logger: Logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  create(createProductDto: CreateProductDto) {
    try {
      return this.product.create({
        data: createProductDto,
      });
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: error.statusCode,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit } = paginationDto;

      const total = await this.product.count({
        where: { available: true },
      });

      const products = await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      });

      return {
        data: products,
        meta: {
          total,
          currentPage: page,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (e) {
      throw new RpcException({
        message: e.message,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      console.log('in throw');

      throw new RpcException({
        message: `Product with ID ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: __, ...data } = updateProductDto;

      await this.findOne(id);

      return this.product.update({
        where: { id },
        data,
      });
    } catch (e) {
      throw e;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      return this.product.update({
        where: { id },
        data: { available: false },
      });
    } catch (e) {
      throw e;
    }
  }

  async validateProducts(ids: number[]) {
    const uniqueIds = [...new Set(ids)];

    const products = await this.product.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
    });

    if (products.length !== uniqueIds.length) {
      throw new RpcException({
        message: 'Some products are not valid',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
