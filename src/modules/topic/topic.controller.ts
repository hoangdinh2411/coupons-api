import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicDto } from './dto/topic.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants/enum/roles.enum';
import { Public } from 'common/decorators/public.decorator';
import { ApiQuery } from '@nestjs/swagger';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  create(@Body() createTopicDto: TopicDto) {
    return this.topicService.create(createTopicDto);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search_text', required: false, type: String })
  findAll(
    @Query('page') page: number,
    @Query('search_text') search_text: string,
  ) {
    return this.topicService.findAll(page, search_text);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.topicService.findOneById(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  update(@Param('id') id: string, @Body() updateTopicDto: TopicDto) {
    return this.topicService.update(+id, updateTopicDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.topicService.remove(+id);
  }
}
