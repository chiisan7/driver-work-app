# 1. ベースとなるNode.jsの公式イメージを選択
FROM node:20-alpine

# 2. コンテナ内の作業ディレクトリを作成
WORKDIR /usr/src/app

# 3. 最初にpackage.jsonとpackage-lock.jsonをコピー
# これにより、依存関係に変更がない限り、npm installのレイヤーはキャッシュされる
COPY package*.json ./

# 4. 依存関係をインストール
RUN npm install

# 5. プロジェクトのソースコードをすべてコピー
COPY . .

# 6. アプリケーションが使用するポートを公開
EXPOSE 3000

# 7. コンテナ起動時に実行するコマンド
# package.jsonのscriptsにある開発用コマンド（例: "dev"）を指定
CMD [ "npm", "run", "dev" ]