import { Controller, Get, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import { Public } from 'common/decorators/public.decorator';
import { ApiQuery } from '@nestjs/swagger';

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
  @Get('/topics')
  @Public()
  allTopics() {
    return this.clientService.getTopics();
  }

  @Get('/blogs')
  @Public()
  getBlogs() {
    return this.clientService.getLatestBlogs();
  }
  @Get('/stores')
  @Public()
  @ApiQuery({ name: 'first_letter', required: false, type: String })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  allStores(
    @Query('first_letter') first_letter?: string,
    @Query('search_text') search_text?: string,
  ) {
    if (!first_letter) {
      first_letter = 'A';
    }

    return this.clientService.getStores(first_letter, search_text);
  }
}
