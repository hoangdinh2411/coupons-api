import { BaseEntity } from 'common/constants/base.entity';

export function makeMetaDataContent(data: BaseEntity, image = '', slug = '') {
  return {
    title: data.meta_data.title || '',
    description: data.meta_data.description || ' ',
    keywords: data.meta_data.keywords || [],
    image,
    slug,
  };
}
