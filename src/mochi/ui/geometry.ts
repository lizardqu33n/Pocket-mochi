/** Layout measurements remain private; authored CSS owns visual limits/offsets. */
export {cssPixelToken as mochiPixelToken} from '../../frontend/shared.js'
export function measureMochiComposer(input:HTMLTextAreaElement):void {
 input.style.setProperty('--mochi-measured-composer-height','auto')
 input.style.setProperty('--mochi-measured-composer-height',`${input.scrollHeight}px`)
}
