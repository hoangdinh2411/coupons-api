import { BaseEntity } from 'common/constants/base.entity';

export function makeMetaDataContent(data: BaseEntity, image = '', slug = '') {
  return {
    title: data.seo_title || '',
    description: data.seo_description || ' ',
    keywords: data.seo_keywords || [],
    image,
    slug,
  };
}
