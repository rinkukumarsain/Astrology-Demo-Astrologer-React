"use client";

let AgoraRTC = null;

class AgoraService {
  client = null;
  localTracks = { audio: null, video: null };
  remoteUsers = {};
  listeners = [];

  async init(appId) {
    if (this.client) return;

    if (!AgoraRTC) {
      if (typeof window !== "undefined") {
        try {
          const module = await import("agora-rtc-sdk-ng");
          AgoraRTC = module.default || module;
          AgoraRTC.enableLogUpload();
          AgoraRTC.setLogLevel(1); // 1: Error, 2: Warn, 3: Info, 4: Debug
        } catch (error) {
          console.error("[Agora] Failed to load SDK:", error);
          return;
        }
      } else {
        return;
      }
    }

    if (!this.client) {
      this.client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      this.client.on("user-published", this.handleUserPublished);
      this.client.on("user-unpublished", this.handleUserUnpublished);
      this.client.on("user-left", this.handleUserLeft);
      this.client.on("exception", this.handleException);

      console.log("✅ Agora RTC initialized");
    }
  }

  async join({ appId, channel, token, uid }) {
    await this.init(appId);
    if (!this.client) throw new Error("Agora client not initialized");

    console.log("🚀 Joining channel:", channel);
    try {
      await this.client.join(appId, channel, token || null, uid || null);
      console.log("✅ Joined channel successfully");
    } catch (error) {
      console.error("❌ Failed to join channel:", error);
      throw error;
    }
  }

  async publish({ audio = true, video = false }) {
    if (!AgoraRTC || !this.client) return;
    const tracks = [];

    try {
      if (audio && !this.localTracks.audio) {
        this.localTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();
        tracks.push(this.localTracks.audio);
      }

      if (video && !this.localTracks.video) {
        this.localTracks.video = await AgoraRTC.createCameraVideoTrack();
        tracks.push(this.localTracks.video);
      }

      if (tracks.length > 0) {
        await this.client.publish(tracks);
        console.log("📡 Local tracks published");
      }
    } catch (error) {
      console.error("❌ Failed to publish tracks:", error);
      throw error;
    }
  }

  async leave() {
    console.log("🚪 Leaving Agora channel...");
    
    // Stop and close local tracks
    if (this.localTracks.audio) {
      this.localTracks.audio.stop();
      this.localTracks.audio.close();
      this.localTracks.audio = null;
    }
    if (this.localTracks.video) {
      this.localTracks.video.stop();
      this.localTracks.video.close();
      this.localTracks.video = null;
    }

    this.remoteUsers = {};

    if (this.client) {
      try {
        await this.client.leave();
        console.log("✅ Left channel successfully");
      } catch (error) {
        console.error("❌ Error while leaving channel:", error);
      }
    }
    this.notify();
  }

  async toggleMic(enabled) {
    if (this.localTracks.audio) {
      await this.localTracks.audio.setEnabled(enabled);
      return enabled;
    }
    return false;
  }

  /* ---------------- EVENTS ---------------- */

  handleUserPublished = async (user, mediaType) => {
    console.log(`👤 Remote user ${user.uid} published ${mediaType}`);
    if (this.client) {
      await this.client.subscribe(user, mediaType);
      this.remoteUsers[user.uid] = user;
      
      if (mediaType === "audio") {
        user.audioTrack.play();
      }
    }
    this.notify();
  };

  handleUserUnpublished = (user, mediaType) => {
    console.log(`👤 Remote user ${user.uid} unpublished ${mediaType}`);
    if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.stop();
    }
    this.notify();
  };

  handleUserLeft = (user) => {
    console.log(`👤 Remote user ${user.uid} left`);
    delete this.remoteUsers[user.uid];
    this.notify();
  };

  handleException = (event) => {
    console.warn("[Agora] RTC Exception:", event.code, event.msg, event.uid);
  };

  /* ---------------- STATE ---------------- */

  subscribe(listener) {
    this.listeners.push(listener);
    listener({ ...this.remoteUsers });
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== listener);
    };
  }

  notify() {
    this.listeners.forEach((fn) => fn({ ...this.remoteUsers }));
  }
}

export const agoraService = new AgoraService();
