import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { ProductCatalog } from './product-catalog.model';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CatalogDto } from './dto/create-catalog.dto';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectModel(ProductCatalog)
    private readonly productCatalogModel: ReturnModelType<
      typeof ProductCatalog
    >,
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async validateToken(token: string) {
    const data = await lastValueFrom(
      this.rabbitClient.send('validate-token', { token }),
    );
    return data;
    
  }

  async checkOwnership(productId: string, userId: string) {
    const product = await this.productCatalogModel.findById(productId).exec();
    if (!product) throw new ForbiddenException('Product not found');
    if (product.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to modify this product');
    }
    return product;
  }

  async create(catalogDto: CatalogDto) {    
    const result = await this.productCatalogModel.create(catalogDto);
    return result;
  }

  async findAllByUser(userId: string) {
    const data = await this.productCatalogModel.find({ userId }).exec();
    return data;
  }

  async findOne(id: string) {
    const data = await this.productCatalogModel.findById(id).exec();
    return data;
  }

  async update(id: string, catalogDto: CatalogDto) {
    const data = await this.productCatalogModel.findByIdAndUpdate(id, catalogDto, { new: true });
    return data;
  }

  async delete(id: string) {
    const data = await this.productCatalogModel.findByIdAndDelete(id);
    return data;
  }
}
