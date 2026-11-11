import { performance } from 'perf_hooks'

export const timePlugin = {
  requestDidStart(requestContext) {
    const timeNow = performance.now()

    return {
      async willSendResponse() {
        console.log(
          'Request Query:\n' +
            requestContext.request.query +
            `${performance.now() - timeNow} ms`
        )
      },
    }
  },
}
