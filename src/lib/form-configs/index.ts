import { userFormConfig, userEditFormConfig } from './user.config'
import { roleFormConfig } from './role.config'
import { postFormConfig } from './post.config'
import { categoryFormConfig } from './category.config'
import { tagFormConfig } from './tag.config'
import { FormConfig } from './types'

export const formConfigs: Record<string, FormConfig> = {
    User: userFormConfig,
    UserEdit: userEditFormConfig,
    Role: roleFormConfig,
    Post: postFormConfig,
    Category: categoryFormConfig,
    Tag: tagFormConfig,
}

export * from './types'
export { userFormConfig, userEditFormConfig }
export { roleFormConfig }
export { postFormConfig }
export { categoryFormConfig }
export { tagFormConfig }
