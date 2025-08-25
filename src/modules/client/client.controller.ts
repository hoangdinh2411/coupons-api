import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiQuery } from '@nestjs/swagger';
import { TopicService } from 'modules/topic/topic.service';
import { BlogService } from 'modules/blogs/blogs.service';
import { StoresService } from 'modules/stores/services/stores.service';
import { CategoriesService } from 'modules/categories/categories.service';
import { CommentsService } from 'modules/comments/comments.service';
import { CouponsService } from 'modules/coupons/coupons.service';
import { PagesService } from 'modules/pages/pages.service';
import { FilterDto } from 'common/constants/filter.dto';
import { isNumeric } from 'common/helpers/number';

@Controller('client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly topicService: TopicService,
    protected readonly blogsService: BlogService,
    private readonly storeService: StoresService,
    private readonly categoryService: CategoriesService,
    private readonly commentService: CommentsService,
    private readonly pagesService: PagesService,
    private readonly couponService: CouponsService,
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
    return this.storeService.getStoreDetail(slug);
  }

  @Get('/blogs/latest')
  async getLatestBlogs() {
    return await this.blogsService.getLatestBlogs(7);
  }

  @Get('/blogs/all')
  async getAllBlogs(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const params: FilterDto = {};
    if (isNumeric(page) && isNumeric(limit)) {
      params.page = +page;
      params.limit = +limit;
    }
    return await this.blogsService.filter(params, null, true);
  }

  @Get('/blogs/trending')
  async getTrendingBlogs() {
    return await this.blogsService.getTrending(6);
  }

  @Get('/blogs/topics')
  async getBlogsPerTopic() {
    return await this.blogsService.findLatestBlogPerTopic();
  }
  @Get('/topic/:slug/blogs')
  async getBlogsByTopic(
    @Param('slug') slug: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const [results, total] = await this.blogsService.findBlogsByTopic(
      slug,
      +page,
      +limit,
    );

    return {
      results,
      total,
    };
  }

  @Get('/blogs')
  async getBlogBySlug(@Query('slug') slug: string) {
    const blog = await this.blogsService.findOne(slug);
    let read_more = [];
    if (blog.topic.id) {
      const [result] = await this.blogsService.findBlogsByTopic(
        blog.topic.slug,
        1,
        6,
        blog.id,
      );
      read_more = result;
    }

    return {
      blog,
      read_more,
    };
  }

  @Get('/blogs/:blog_id/comments')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllCommentForBlog(
    @Param('blog_id') blog_id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const [results, total] = await this.commentService.findAll(
      +blog_id,
      +page,
      +limit,
    );
    return {
      results,
      total,
    };
  }

  @Get('/search')
  @ApiQuery({ name: 'search_text', required: true, type: String })
  async search(@Query('search_text') search_text?: string) {
    const [blogs, categories, stores] = await Promise.all([
      this.blogsService.filter({ search_text }, null, true),
      this.categoryService.findAll(null, null, search_text),
      this.storeService.findStoreForClient(null, search_text),
    ]);

    return {
      blogs: blogs.results ?? [],
      categories: categories.results ?? [],
      stores: stores ?? [],
    };
  }
  @Get('/coupons')
  async getCouponById(@Query('id') id?: string) {
    return await this.couponService.findOne(+id);
  }

  @Get('/categories/:slug')
  async getCategoryDetail(@Param('slug') slug?: string) {
    const category = await this.categoryService.findOne(slug);
    const top_stores = await this.clientService.getTopStoreToday(
      category.id,
      1,
    );
    const promise_all_values = [
      this.clientService.countCouponsByCategory(category.id),
      this.clientService.getSimilarStoresByCategory(category.id),
    ];
    if (top_stores) {
      promise_all_values.push(
        this.couponService.filter({
          stores: top_stores.map((s) => s.id),
          limit: 12,
          page: 1,
        }),
      );
    }
    const [count_coupons, similar_stores, top_deals] =
      await Promise.all(promise_all_values);

    return {
      category,
      count_coupons,
      similar_stores,
      top_deals: top_deals.results,
    };
  }
  @Get('/categories')
  async getAllCategoriesWithStores() {
    const categories = await this.categoryService.findAll();
    const data = await Promise.all(
      categories.results.map(async (c) => {
        const stores = await this.storeService.filter({
          categories: [c.id],
        });
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image,
          stores: stores.results,
        };
      }),
    );

    return data;
  }
  @Get('/home')
  async getDataForHomePage() {
    const top_stores = await this.clientService.getTopStoreToday(null, 6);

    const top_deal_today = await this.couponService.filter({
      stores: [top_stores[0].id],
      limit: 12,
      page: 1,
    });

    const other_top_stores = top_stores.slice(1, top_stores.length);
    const top_deals = await this.couponService.filter({
      stores: other_top_stores.slice(0).map((s) => s.id),
      limit: 20,
      page: 1,
    });
    return {
      top_deal_today: top_deal_today.results ?? [],
      top_deals: top_deals.results ?? [],
    };
  }
  @Get('/categories/:id/coupons')
  async getCouponByCategory(
    @Param('id') id: string,
    @Query('page') page: string,
  ) {
    return this.clientService.getCouponsByCategory(+id, +page);
  }

  @Get('/pages/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.pagesService.findOne(slug);
  }
}
