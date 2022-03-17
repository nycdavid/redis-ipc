# frozen_string_literal: true

sub_client = Redis.new(host: "localhost", port: 6379)
pub_client = Redis.new(host: "localhost", port: 6379)

sub_client.subscribe("test_factories_rails") do |on|
  puts "Subscribing to test_factories_rails..."

  on.message do |_channel, msg|
    channel_id, resource = msg.split(":||:")
    puts "Received factory request for #{resource}"
    pub_client.set(channel_id, FactoryBot.attributes_for(resource).to_json)
  end
end
