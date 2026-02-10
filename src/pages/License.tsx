import { Header } from '@/components/Header';

export default function License() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 prose prose-neutral dark:prose-invert">
        <h1>Software License</h1>
        <p className="text-muted-foreground">Copyright (C) 2025 MRWAIN ORGANIZATION</p>

        <div className="bg-card rounded-2xl p-6 mt-6 text-foreground text-sm leading-relaxed not-prose">
          <p className="mb-4">
            Permission is hereby granted by the application software developer ("Software Developer"), free of charge, to any person obtaining a copy of this application, software and associated documentation files (the "Software"), which was developed by the Software Developer for use on Pi Network, whereby the purpose of this license is to permit the development of derivative works based on the Software, including the right to use, copy, modify, merge, publish, distribute, sub-license, and/or sell copies of such derivative works and any Software components incorporated therein, and to permit persons to whom such derivative works are furnished to do so, in each case, solely to develop, use and market applications for the official Pi Network.
          </p>

          <p className="mb-4">
            For purposes of this license, Pi Network shall mean any application, software, or other present or future platform developed, owned or managed by Pi Community Company, and its parents, affiliates or subsidiaries, for which the Software was developed, or on which the Software continues to operate. However, you are prohibited from using any portion of the Software or any derivative works thereof in any manner (a) which infringes on any Pi Network intellectual property rights, (b) to hack any of Pi Network's systems or processes or (c) to develop any product or service which is competitive with the Pi Network.
          </p>

          <p className="mb-4">
            The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
          </p>

          <p className="mb-4 uppercase font-semibold text-xs text-muted-foreground">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PUBLISHERS, OR COPYRIGHT HOLDERS OF THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO BUSINESS INTERRUPTION, LOSS OF USE, DATA OR PROFITS) HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE) ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>

          <p className="text-muted-foreground text-xs">
            Pi, Pi Network and the Pi logo are trademarks of the Pi Community Company.
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-8">Copyright (C) 2025 MRWAIN ORGANIZATION</p>
      </main>
    </div>
  );
}
