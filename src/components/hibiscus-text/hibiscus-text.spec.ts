import { render } from '@stencil/core/testing';
import { HibiscusTextComponent } from './hibiscus-text';

describe('hibiscus-text', () => {
  it('should build', () => {
    expect(new HibiscusTextComponent()).toBeTruthy();
  });

  describe('rendering', () => {
    let element;
    beforeEach(async () => {
      element = await render({
        components: [HibiscusTextComponent],
        html: '<hibiscus-text></hibiscus-text>'
      });
    });
  })
});
