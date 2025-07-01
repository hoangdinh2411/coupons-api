import { Controller, Get } from '@nestjs/common';
import { ClientService } from './client.service';
import { Public } from 'common/decorators/public.decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('/menu')
  @Public()
  menu() {
    return this.clientService.getMenu();
  }
  @Get('/categories')
  @Public()
  allCategories() {
    return this.clientService.getAllCategoryWithAllStore();
  }
}
