import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">プライバシーポリシー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <p className="text-gray-700 leading-relaxed">
                {APP_TITLE}（以下「当サービス」）は、利用者の個人情報の保護を重要な責務と認識し、以下のとおりプライバシーポリシーを定め、個人情報の適切な取り扱いに努めます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">1. 個人情報の定義</h2>
              <p className="text-gray-700 leading-relaxed">
                個人情報とは、個人情報保護法第2条第1項により定義された個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）、もしくは個人識別符号が含まれる情報を指します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">2. 個人情報の収集方法</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>当サービスは、利用者が利用登録をする際に、以下の個人情報を収集します：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>氏名</li>
                  <li>メールアドレス</li>
                  <li>プロフィール写真</li>
                  <li>その他、利用者が任意で提供する情報</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">3. 個人情報の利用目的</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>当サービスは、収集した個人情報を以下の目的で利用します：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>当サービスの提供・運営のため</li>
                  <li>利用者からのお問い合わせに対応するため</li>
                  <li>利用者の本人確認を行うため</li>
                  <li>利用規約に違反した利用者や、不正・不当な目的でサービスを利用しようとする利用者の特定をし、ご利用をお断りするため</li>
                  <li>利用者にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                  <li>サービスの改善や新サービスの開発のため</li>
                  <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                  <li>上記の利用目的に付随する目的</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">4. 個人情報の第三者提供</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>当サービスは、次に掲げる場合を除いて、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                  <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">5. 個人情報の開示・訂正・削除</h2>
              <p className="text-gray-700 leading-relaxed">
                利用者は、当サービスの保有する自己の個人情報について、開示、訂正、削除を求めることができます。その際は、当サービスが定める方法により、ご本人であることを確認させていただいた上で、合理的な期間および範囲で対応いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">6. Cookie（クッキー）の使用について</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスは、利用者により良いサービスを提供するため、Cookieを使用することがあります。Cookieとは、Webサーバーが利用者のコンピュータを識別する業界標準の技術です。Cookieは利用者のコンピュータを識別することはできますが、利用者が個人情報を入力しない限り利用者自身を識別することはできません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">7. アクセス解析ツールについて</h2>
              <p className="text-gray-700 leading-relaxed">
                当サービスは、サービスの利用状況を把握するため、アクセス解析ツールを使用することがあります。これらのツールは、トラフィックデータの収集のためにCookieを使用することがあります。トラフィックデータは匿名で収集されており、個人を特定するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">8. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、利用者に通知することなく、変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">9. お問い合わせ窓口</h2>
              <p className="text-gray-700 leading-relaxed">
                本ポリシーに関するお問い合わせは、当サービスのお問い合わせフォームよりお願いいたします。
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">制定日: 2025年1月1日</p>
              <p className="text-sm text-gray-500">最終更新日: 2025年1月1日</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
