import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiQuery } from '@nestjs/swagger';
import { TopicService } from 'modules/topic/topic.service';
import { BlogService } from 'modules/blogs/blogs.service';
import { StoresService } from 'modules/stores/services/stores.service';
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
  @Get('/topics')
  async allTopics() {
    const { results } = await this.topicService.findAll();
    return results;
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
  @Get('/stores/:slug')
  getStoreBySlug(@Param('slug') slug: string) {
    return this.storeService.findOne(slug);
  }

  @Get('/blogs/latest')
  async getLatestBlogs() {
    return await this.blogsService.getLatestBlogs(6);
  }
  @Get('/blogs/trending')
  async getTrendingBlogs() {
    return await this.blogsService.getTrending(6);
  }

  @Get('/blogs/topics')
  async getBlogsPerTopic() {
    return await this.blogsService.findLatestBlogPerTopic();
  }

  @Get('/blogs')
  async getBlogBySlug(@Query('slug') slug: string) {
    const blog = await this.blogsService.findOne(slug);
    let read_more = [];
    if (blog.topic_id) {
      const [result] = await this.blogsService.findBlogsByTopic(
        blog.topic_id,
        5,
        1,
      );
      read_more = result;
    }

    return {
      blog,
      read_more,
    };
  }

  @Get('/search')
  @ApiQuery({ name: 'search_text', required: true, type: String })
  async search(@Query('search_text') search_text?: string) {
    const [blogs, categories, stores] = await Promise.all([
      this.blogsService.filter({ search_text }),
      this.categoryService.findAll(null, null, search_text),
      this.storeService.findStoreForClient(null, search_text),
    ]);
    return {
      blogs: blogs.results ?? [],
      categories: categories.results ?? [],
      stores: stores ?? [],
    };
  }
}
