import { Controller, Get, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiQuery } from '@nestjs/swagger';
import { TopicService } from 'modules/topic/topic.service';
import { BlogService } from 'modules/blogs/blogs.service';
import { StoresService } from 'modules/stores/stores.service';
import { CategoriesService } from 'modules/categories/categories.service';

@Controller('client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly topicService: TopicService,
    protected readonly blogsService: BlogService,
    private readonly storeService: StoresService,
    private readonly categoryService: CategoriesService,
  ) {}

  @Get('/menu')
  menu() {
    return this.clientService.getMenu();
  }
  @Get('/categories')
  async allCategories() {
    const { results } = await this.categoryService.findAll();
    return results;
  }
  @Get('/topics')
  async allTopics() {
    const { results } = await this.topicService.findAll();
    return results;
  }

  @Get('/blogs')
  getBlogs() {
    return this.blogsService.getLatestBlogs();
  }
  @Get('/stores')
  @ApiQuery({ name: 'first_letter', required: false, type: String })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  allStores(
    @Query('first_letter') first_letter?: string,
    @Query('search_text') search_text?: string,
  ) {
    if (!first_letter) {
      first_letter = 'A';
    }

    return this.storeService.findStoreForClient(first_letter, search_text);
  }
}
