import discord
from discord.ext import commands
import datetime
from upstash_redis import Redis
import os
from dotenv import load_dotenv
import pytz
import json

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

# Upstash Redis Connection
redis = Redis(url="https://light-bass-33631.upstash.io", token=os.getenv('REDIS_PASSWORD'))

intents = discord.Intents.all()
intents.messages = True  # If your bot needs to receive messages

# Setting up the bot
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user.name} has connected to Discord!')

@bot.command(name='flycast', help='Sets the FLYcast with the current timestamp')
async def set_fly(ctx, count: float):
    print(f"setfly")
    print(f"Received setfly command with count {count}")
    if not isinstance(count, float) or count < 0 or count > 10000:
        await ctx.send("That's not a valid FLY amount you silly goose!")
        return
    eastern = pytz.timezone('US/Eastern')
    date_key = datetime.datetime.now(eastern).strftime("%Y-%m-%d")
    full_timestamp = datetime.datetime.now(eastern).strftime("%Y-%m-%d %H:%M:%S")

    try:
        # Retrieve the existing data
        existing_data = redis.get(date_key)
        if existing_data:
            # Deserialize the existing data
            flycast_array = json.loads(existing_data)
            print(f"Existing data: {flycast_array}")
        else:
            flycast_array = []

        # Append the new data
        flycast_array.append({'timestamp': full_timestamp, 'count': count})

        # Serialize and save the updated array to Redis
        redis.set(date_key, json.dumps(flycast_array))

        print(f"FLY count set to {count} at {full_timestamp}")
        await ctx.send(f"[FLYcast](https://fly.town) set to {count} 🚀")
    except Exception as e:
        print(f"Error: {e}")
        await ctx.send("An error occurred while setting the FLYcast.")

bot.run(TOKEN)
