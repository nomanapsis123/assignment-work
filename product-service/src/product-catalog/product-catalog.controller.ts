import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Delete,
  Patch,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CatalogDto } from './dto/create-catalog.dto';

@Controller('catalog')
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) {}
  @Post()
  async create(
    @Body() catalogDto: CatalogDto,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token missing');

    const validation = await this.catalogService.validateToken(token);
    const data = await this.catalogService.create(catalogDto);
    return { message: 'Successful', result: data };
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    const data = await this.catalogService.findAllByUser(userId);

    return { message: 'Successful', result: data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.catalogService.findOne(id);
    return { message: 'Successful', result: data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token missing');

    const validation = await this.catalogService.validateToken(token);
    await this.catalogService.checkOwnership(id, validation.id);
    const data = await this.catalogService.update(id, body);
    if (data) {
      return { message: 'Successful', result: 'updated successfully' };
    } else {
      throw new BadRequestException(`not updated`);
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token missing');

    const validation = await this.catalogService.validateToken(token);
    await this.catalogService.checkOwnership(id, validation.id);
    const data = await this.catalogService.delete(id);
    if (data) {
      return { message: 'Successful', result: 'Deleted successfully' };
    } else {
      throw new BadRequestException(`Not Deleted!`);
    }
  }

  // RabbitMQ Event Listener for 'user.created'
  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any) {
    console.log(
      'Received user.created event in ProductCatalogController:',
      data,
    );
  }
}
